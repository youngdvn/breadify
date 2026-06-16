package config

import (
	"bufio"
	"errors"
	"os"
	"strings"
)

type Config struct {
	Port             string
	DatabaseURL      string
	StoreName        string
	StorePhone       string
	StoreAddress     string
	StoreBankID      string
	StoreBankAccount string
	StoreBankOwner   string
}

func Load() (Config, error) {
	cfg := Config{
		Port:             getenv("PORT", "8080"),
		DatabaseURL:      os.Getenv("DATABASE_URL"),
		StoreName:        getenv("STORE_NAME", "Breadify"),
		StorePhone:       os.Getenv("STORE_PHONE"),
		StoreAddress:     os.Getenv("STORE_ADDRESS"),
		StoreBankID:      os.Getenv("STORE_BANK_ID"),
		StoreBankAccount: os.Getenv("STORE_BANK_ACCOUNT"),
		StoreBankOwner:   os.Getenv("STORE_BANK_OWNER"),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, errors.New("DATABASE_URL is required")
	}

	return cfg, nil
}

func LoadDotEnv(path string) error {
	file, err := os.Open(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil
		}
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}

		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if key != "" && os.Getenv(key) == "" {
			_ = os.Setenv(key, value)
		}
	}

	return scanner.Err()
}

func getenv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
