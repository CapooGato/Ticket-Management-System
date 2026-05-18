package ticket_management_system.MASI.ticket.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ticket_management_system.MASI.ticket.dto.PatchTicketDto;
import ticket_management_system.MASI.ticket.exceptions.TicketNotFoundException;
import ticket_management_system.MASI.ticket.model.Status;
import ticket_management_system.MASI.ticket.model.Ticket;
import ticket_management_system.MASI.ticket.repository.TicketRepository;
import ticket_management_system.MASI.user.exceptions.UserNotFoundException;
import ticket_management_system.MASI.user.model.Users;
import ticket_management_system.MASI.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public Ticket save(Ticket ticket){
        Users users = userRepository.findById(ticket.getUser().getId())
                .orElseThrow(() -> new UserNotFoundException(ticket.getUser().getId()));

        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUser(users);
        return ticketRepository.save(ticket);
    }

    public Ticket getById(Long id){
        return ticketRepository.findById(id).orElseThrow(() -> new TicketNotFoundException(id));
    }

    @Transactional
    public Ticket patchTicket(Long ticketId, PatchTicketDto patchTicketDto){
        Ticket ticket = getById(ticketId);
        ticket.setHrComment(patchTicketDto.getHrComment());
        ticket.setStatus(patchTicketDto.getStatus());
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket patchHrComment(Long ticketId, String hrComment){
        Ticket ticket = getById(ticketId);
        ticket.setHrComment(hrComment);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket patchStatus(Long ticketId, Status status){
        Ticket ticket = getById(ticketId);
        ticket.setStatus(status);
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getTicketsByUserId(Long id){
        return ticketRepository.findByUserId(id);
    }
}
