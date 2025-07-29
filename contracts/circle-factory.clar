;; Circle Factory Contract
;; Allows users to create and manage token-based circles

(define-data-var contract-admin principal tx-sender)

(define-map circles
  uint
  {
    name: (string-ascii 50),
    description: (string-ascii 140),
    creator: principal,
    metadata-uri: (string-ascii 256)
  }
)

(define-map circle-members
  { circle-id: uint, member: principal }
  bool
)

(define-map membership-requests
  { circle-id: uint, requester: principal }
  bool
)

(define-data-var circle-counter uint u0)

;; Constants
(define-constant ERR-NOT-ADMIN u100)
(define-constant ERR-CIRCLE-NOT-FOUND u101)
(define-constant ERR-NOT-CREATOR u102)
(define-constant ERR-ALREADY-MEMBER u103)
(define-constant ERR-NO_REQUEST u104)
(define-constant ERR-ALREADY_REQUESTED u105)

;; PRIVATE HELPERS

(define-private (is-admin)
  (is-eq tx-sender (var-get contract-admin))
)

(define-private (circle-exists? (id uint))
  (is-some (map-get? circles id))
)

;; PUBLIC FUNCTIONS

(define-public (create-circle
    (name (string-ascii 50))
    (description (string-ascii 140))
    (metadata-uri (string-ascii 256)))
  (let
    (
      (circle-id (+ (var-get circle-counter) u1))
    )
    (begin
      (var-set circle-counter circle-id)
      (map-set circles circle-id {
        name: name,
        description: description,
        creator: tx-sender,
        metadata-uri: metadata-uri
      })
      (map-set circle-members { circle-id: circle-id, member: tx-sender } true)
      (ok circle-id)
    )
  )
)

(define-public (request-membership (circle-id uint))
  (begin
    (asserts! (circle-exists? circle-id) (err ERR-CIRCLE-NOT-FOUND))
    (asserts! (is-none (map-get? membership-requests { circle-id: circle-id, requester: tx-sender })) (err ERR-ALREADY_REQUESTED))
    (map-set membership-requests { circle-id: circle-id, requester: tx-sender } true)
    (ok true)
  )
)

(define-public (approve-request (circle-id uint) (requester principal))
  (let
    (
      (circle (unwrap! (map-get? circles circle-id) (err ERR-CIRCLE-NOT-FOUND)))
    )
    (begin
      (asserts! (is-eq tx-sender (get creator circle)) (err ERR-NOT-CREATOR))
      (asserts! (is-some (map-get? membership-requests { circle-id: circle-id, requester: requester })) (err ERR-NO_REQUEST))
      (map-delete membership-requests { circle-id: circle-id, requester: requester })
      (map-set circle-members { circle-id: circle-id, member: requester } true)
      (ok true)
    )
  )
)

(define-public (deny-request (circle-id uint) (requester principal))
  (let
    (
      (circle (unwrap! (map-get? circles circle-id) (err ERR-CIRCLE-NOT-FOUND)))
    )
    (begin
      (asserts! (is-eq tx-sender (get creator circle)) (err ERR-NOT-CREATOR))
      (asserts! (is-some (map-get? membership-requests { circle-id: circle-id, requester: requester })) (err ERR-NO_REQUEST))
      (map-delete membership-requests { circle-id: circle-id, requester: requester })
      (ok true)
    )
  )
)

(define-public (update-metadata (circle-id uint) (new-uri (string-ascii 256)))
  (let
    (
      (circle (unwrap! (map-get? circles circle-id) (err ERR-CIRCLE-NOT-FOUND)))
    )
    (begin
      (asserts! (is-eq tx-sender (get creator circle)) (err ERR-NOT-CREATOR))
      (map-set circles circle-id {
        name: (get name circle),
        description: (get description circle),
        creator: (get creator circle),
        metadata-uri: new-uri
      })
      (ok true)
    )
  )
)

(define-public (is-member (circle-id uint) (user principal))
  (ok (default-to false (map-get? circle-members { circle-id: circle-id, member: user })))
)

(define-public (delete-circle (circle-id uint))
  (let
    (
      (circle (unwrap! (map-get? circles circle-id) (err ERR-CIRCLE-NOT-FOUND)))
    )
    (begin
      (asserts! (is-eq tx-sender (get creator circle)) (err ERR-NOT-CREATOR))
      (map-delete circles circle-id)
      (ok true)
    )
  )
)

(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-ADMIN))
    (var-set contract-admin new-admin)
    (ok true)
  )
)
