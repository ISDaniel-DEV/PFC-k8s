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
import org.springframework.web.servlet.ModelAndView;

@RestController
public class UsuarioController {

    private static final Logger log = LoggerFactory.getLogger(UsuarioController.class);

    @Autowired
    private UsuarioService usuarioService;
    
    @PostMapping("/registro")
    public UsuarioDTO save(@RequestBody UsuarioDTO usuarioDTO) {
        log.info("UsuarioRestController - save: Guardar usuario: " + usuarioDTO.toString());
        
        log.info("datos del usuario registrado" + usuarioDTO);

        UsuarioDTO existente = usuarioService.findByEmail(usuarioDTO);
        log.info("Resultado de findByEmail: " + existente);

        if(existente != null){
            log.error("El email ya existe");
            UsuarioDTO.updateUsuarioDTO(usuarioDTO, "", "Email ya existente", "",0, "","",false);
            return usuarioDTO;
        }else{
            log.info("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa pene" + usuarioDTO);
            usuarioService.save(usuarioDTO);
            log.info("Usuario registrado correctamente: " + usuarioDTO);
            return usuarioDTO;
        }
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
