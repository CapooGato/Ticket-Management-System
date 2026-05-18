package ticket_management_system.MASI.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ticket_management_system.MASI.ticket.model.Ticket;
import ticket_management_system.MASI.user.model.Users;
import ticket_management_system.MASI.user.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/save")
    public ResponseEntity<Users> saveTicket(@RequestBody Users user){
        return ResponseEntity.ok().body(userService.save(user));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Users>> getUsers(){
        return ResponseEntity.ok().body(userService.getUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Users> getUserById(@PathVariable("id")Long id){
        return ResponseEntity.ok().body(userService.getById(id));
    }
}
