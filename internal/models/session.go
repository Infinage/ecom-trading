package models

import (
	"sync"
	"time"

	"github.com/google/uuid"
)

type Session struct {
	UserId int64
	Token  string
	Expiry time.Time
}

// Ok checks if the session token has expired.
func (s *Session) Ok() bool {
	return time.Now().Before(s.Expiry)
}

type SessionStore struct {
	tokens map[string]Session // Lookup active sessions via token
	uids   map[int64]string   // Rev lookup tokens via user id
	mu     sync.RWMutex       // Safe concurrent read/writes
}

// Initializes a new empty SessionStore.
func NewSessionStore() *SessionStore {
	return &SessionStore{
		tokens: make(map[string]Session),
		uids:   make(map[int64]string),
	}
}

// NewSession creates a token and persists it into an in-memory map,
// assumes provide user ID is valid.
func (ss *SessionStore) NewSession(uid int64) Session {
	sess := Session{
		UserId: uid,
		Token:  uuid.NewString(),
		Expiry: time.Now().Add(24 * time.Hour),
	}

	ss.mu.Lock()
	defer ss.mu.Unlock()

	// Delete existing token by user ID
	if token, ok := ss.uids[uid]; ok {
		delete(ss.tokens, token)
		delete(ss.uids, uid)
	}

	ss.tokens[sess.Token] = sess
	ss.uids[sess.UserId] = sess.Token
	return sess
}

// Delete deletes a session via a token based lookup, 
// no-op if token is not found.
func (ss *SessionStore) Delete(token string) {
	ss.mu.Lock()
	defer ss.mu.Unlock()

	if sess, ok := ss.tokens[token]; ok {
		delete(ss.tokens, token)
		delete(ss.uids, sess.UserId)
	}
}

// Get looks up session store by token and returns session 
// only if it is still not expired.
func (ss *SessionStore) Get(token string) (Session, bool) {
	ss.mu.RLock()	
	defer ss.mu.RUnlock()

	sess, ok := ss.tokens[token]
	if !ok || !sess.Ok() {
		return Session{}, false
	}

	return sess, ok
}
