package ticket_management_system.MASI.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ticket_management_system.MASI.ticket.model.Ticket;
import ticket_management_system.MASI.user.model.Users;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findById(Long userId);
}
