package main

import (
	"context"
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"breadify/apps/api/internal/config"
	"breadify/apps/api/internal/db"
)

func main() {
	if err := config.LoadDotEnv(".env"); err != nil {
		log.Fatal(err)
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	database, err := db.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	if err := migrate(database, "migrations"); err != nil {
		log.Fatal(err)
	}
}

func migrate(database *sql.DB, migrationsPath string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if _, err := database.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version TEXT PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`); err != nil {
		return err
	}

	files, err := filepath.Glob(filepath.Join(migrationsPath, "*.up.sql"))
	if err != nil {
		return err
	}
	sort.Strings(files)

	for _, file := range files {
		version := strings.TrimSuffix(filepath.Base(file), ".up.sql")
		var exists bool
		if err := database.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)", version).Scan(&exists); err != nil {
			return err
		}
		if exists {
			log.Printf("skip migration %s", version)
			continue
		}

		content, err := os.ReadFile(file)
		if err != nil {
			return err
		}

		tx, err := database.BeginTx(ctx, nil)
		if err != nil {
			return err
		}

		if _, err := tx.ExecContext(ctx, string(content)); err != nil {
			_ = tx.Rollback()
			return err
		}
		if _, err := tx.ExecContext(ctx, "INSERT INTO schema_migrations (version) VALUES ($1)", version); err != nil {
			_ = tx.Rollback()
			return err
		}
		if err := tx.Commit(); err != nil {
			return err
		}

		log.Printf("applied migration %s", version)
	}

	return nil
}
