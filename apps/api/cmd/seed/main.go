package main

import (
	"context"
	"log"
	"os"
	"path/filepath"
	"sort"
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

	files, err := filepath.Glob(filepath.Join("seeds", "*.sql"))
	if err != nil {
		log.Fatal(err)
	}
	sort.Strings(files)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	for _, file := range files {
		content, err := os.ReadFile(file)
		if err != nil {
			log.Fatal(err)
		}
		if _, err := database.ExecContext(ctx, string(content)); err != nil {
			log.Fatal(err)
		}
		log.Printf("applied seed %s", filepath.Base(file))
	}
}
