package com.example.springboot_app.web.controller;

import com.example.springboot_app.model.dto.UsuarioDTO;
import com.example.springboot_app.service.UsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class IndexController {

    private static final Logger log = LoggerFactory.getLogger(IndexController.class);

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/UsuarioEmail")
    public ResponseEntity<?> ByEmail(@RequestParam String dato) {
        try {
            if (dato == null || dato.isEmpty()) {
                log.error("El email no puede ser nulo o vacío");
                return ResponseEntity.badRequest().body("El email es requerido");
            }
            
            log.info("Buscando usuario con email: {}", dato);
            UsuarioDTO usuarioDTO = new UsuarioDTO();
            usuarioDTO.setEmail(dato);
            
            UsuarioDTO usuarioEncontrado = usuarioService.findByEmail(usuarioDTO);
            
            if (usuarioEncontrado == null) {
                log.info("No se encontró ningún usuario con el email: {}", dato);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
            }
            
            log.info("Usuario encontrado: {}", usuarioEncontrado);
            return ResponseEntity.ok(usuarioEncontrado);
            
        } catch (Exception e) {
            log.error("Error al buscar usuario por email: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno del servidor");
        }
    }

    @PostMapping("/updateUser")
    public UsuarioDTO updateUser(@RequestBody UsuarioDTO usuarioDTO) {
        log.info("UsuarioRestController - updateUser: Actualizar usuario: " +
                usuarioDTO.toString());
        usuarioService.save(usuarioDTO);
        return usuarioDTO;
    }

    @PostMapping("/updatePrimeraVez")
    public UsuarioDTO updatePrimeraVez(@RequestParam String email) {
        log.info("UsuarioRestController - updatePrimeraVez: Request received");
        log.info("Email parameter: " + email);
        UsuarioDTO usuarioDTO = new UsuarioDTO();
        usuarioDTO.setEmail(email);
        UsuarioDTO usuario = usuarioService.findByEmail(usuarioDTO);
        if (usuario != null) {
            usuario.setPrimera_vez(false);
            usuarioService.save(usuario);
            return usuario;
        }
        return null;

    }

}
