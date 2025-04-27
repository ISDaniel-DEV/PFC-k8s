package com.example.springboot_app.web.controller;

import com.example.springboot_app.model.dto.UsuarioDTO;
import com.example.springboot_app.service.UsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
public class UsuarioController {

    private static final Logger log = LoggerFactory.getLogger(UsuarioController.class);

    @Autowired
    private UsuarioService usuarioService;
    
    @PostMapping("/api/registro")
    public UsuarioDTO save(@RequestBody UsuarioDTO usuarioDTO) {
        log.info("UsuarioRestController - save: Guardar usuario: " +
                usuarioDTO.toString());

        usuarioService.save(usuarioDTO);
        return usuarioDTO;
    }

    


    /*
     * 
    @GetMapping("/usuariosDep/{dato}")
    public List<UsuarioDTO> mostrarItiDeUnViaje (@PathVariable("dato") String dato){
        log.info(dato);
        UsuarioDTO usuarioDTO=new UsuarioDTO();
        usuarioDTO.setIddepartamento(Integer.parseInt(dato));
        log.info(String.valueOf(usuarioDTO));
        return usuarioService.findByIdDep(usuarioDTO);
    }
    */
    
	
}
