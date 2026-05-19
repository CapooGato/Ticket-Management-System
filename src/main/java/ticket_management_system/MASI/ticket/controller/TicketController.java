package ticket_management_system.MASI.ticket.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ticket_management_system.MASI.ticket.service.TicketService;
import ticket_management_system.MASI.ticket.dto.PatchTicketDto;
import ticket_management_system.MASI.ticket.model.Status;
import ticket_management_system.MASI.ticket.model.Ticket;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ticket")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/save")
    public ResponseEntity<Ticket> saveTicket(@RequestBody Ticket ticket){
        return ResponseEntity.ok().body(ticketService.save(ticket));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable("id") Long id){
        return ResponseEntity.ok().body(ticketService.getById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable("id") Long id, @RequestBody PatchTicketDto patchTicketDto){
        return ResponseEntity.ok().body(ticketService.patchTicket(id, patchTicketDto));
    }

    @PatchMapping("/{id}/hr-comment")
    public ResponseEntity<Ticket> patchHrComment(@PathVariable("id") Long id, @RequestBody Map<String, String> payload){
        return ResponseEntity.ok().body(ticketService.patchHrComment(id, payload.get("hrComment")));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> patchStatus(@PathVariable("id") Long id, @RequestBody Map<String, Status> payload){
        return ResponseEntity.ok().body(ticketService.patchStatus(id, payload.get("status")));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<List<Ticket>> getTicketsByUserId(@PathVariable("id")Long id){
        return ResponseEntity.ok().body(ticketService.getTicketsByUserId(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok().body(tickets);
    }
}
