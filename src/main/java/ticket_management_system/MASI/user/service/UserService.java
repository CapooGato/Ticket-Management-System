package ticket_management_system.MASI.user.service;

import org.springframework.stereotype.Service;
import ticket_management_system.MASI.ticket.model.Ticket;
import ticket_management_system.MASI.ticket.repository.TicketRepository;
import ticket_management_system.MASI.user.exceptions.UserNotFoundException;
import ticket_management_system.MASI.user.model.Users;
import ticket_management_system.MASI.user.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public UserService(UserRepository userRepository, TicketRepository ticketRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    public Users save(Users user){
        return userRepository.save(user);
    }

    public List<Users> getUsers(){
        return userRepository.findAll();
    }

    public Users getById(Long id){
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
    }

    public Users login(String email, String password) {
        Optional<Users> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isPresent()) {
            Users user = userOptional.get();
            if (user.getPassword().equals(password)) {
                return user;
            }
        }
        return null;
    }
}
