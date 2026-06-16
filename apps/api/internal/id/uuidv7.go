package id

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

func NewUUIDV7() (string, error) {
	var bytes [16]byte
	now := uint64(time.Now().UnixMilli())

	bytes[0] = byte(now >> 40)
	bytes[1] = byte(now >> 32)
	bytes[2] = byte(now >> 24)
	bytes[3] = byte(now >> 16)
	bytes[4] = byte(now >> 8)
	bytes[5] = byte(now)

	if _, err := rand.Read(bytes[6:]); err != nil {
		return "", err
	}

	bytes[6] = (bytes[6] & 0x0f) | 0x70
	bytes[8] = (bytes[8] & 0x3f) | 0x80

	var encoded [36]byte
	hex.Encode(encoded[0:8], bytes[0:4])
	encoded[8] = '-'
	hex.Encode(encoded[9:13], bytes[4:6])
	encoded[13] = '-'
	hex.Encode(encoded[14:18], bytes[6:8])
	encoded[18] = '-'
	hex.Encode(encoded[19:23], bytes[8:10])
	encoded[23] = '-'
	hex.Encode(encoded[24:36], bytes[10:16])

	return string(encoded[:]), nil
}

func ShortID(uuid string) string {
	cleaned := make([]byte, 0, len(uuid))
	for i := 0; i < len(uuid); i++ {
		if uuid[i] != '-' {
			cleaned = append(cleaned, uuid[i])
		}
	}
	if len(cleaned) <= 8 {
		return string(cleaned)
	}
	return stringsToUpperASCII(string(cleaned[len(cleaned)-8:]))
}

func stringsToUpperASCII(value string) string {
	bytes := []byte(value)
	for i := range bytes {
		if bytes[i] >= 'a' && bytes[i] <= 'z' {
			bytes[i] -= 'a' - 'A'
		}
	}
	return string(bytes)
}
