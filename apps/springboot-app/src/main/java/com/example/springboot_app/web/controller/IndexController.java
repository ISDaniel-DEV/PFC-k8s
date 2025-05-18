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

@RestController
@CrossOrigin(origins = "*")
public class IndexController {

    private static final Logger log = LoggerFactory.getLogger(IndexController.class);

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/UsuarioEmail")
    public UsuarioDTO ByEmail(@RequestParam String dato) {
        if (dato == null || dato.isEmpty()) {
            log.error("El dato no puede ser nulo o vacío");
            return null;
        } else {
            log.info(dato);
            UsuarioDTO usuarioDTO = new UsuarioDTO();
            usuarioDTO.setEmail(dato);
            log.info(String.valueOf(usuarioDTO));
            return usuarioService.findByEmail(usuarioDTO);
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
