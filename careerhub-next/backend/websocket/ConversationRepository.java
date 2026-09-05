package com.graphix.careerhub.messaging;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participantOneId = :userId OR c.participantTwoId = :userId) " +
           "ORDER BY c.lastMessageAt DESC")
    List<Conversation> findByUserId(Long userId);

    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participantOneId = :p1 AND c.participantTwoId = :p2) OR " +
           "(c.participantOneId = :p2 AND c.participantTwoId = :p1)")
    Optional<Conversation> findBetween(Long p1, Long p2);
}
