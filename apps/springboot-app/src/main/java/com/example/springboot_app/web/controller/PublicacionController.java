package com.example.springboot_app.web.controller;

import com.example.springboot_app.model.dto.PublicacionDTO;
import com.example.springboot_app.service.PublicacionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

@RestController
public class PublicacionController {

    private static final Logger log = LoggerFactory.getLogger(PublicacionController.class);

    @Autowired
    private PublicacionService publicacionService;

    @GetMapping("/listadoPublicaciones")
    public List<PublicacionDTO> findAll() {

        log.info("ClienteRestController - findAll: Mostramos todos los clientes");

        List<PublicacionDTO> listapubDTO = publicacionService.findAll();
        return listapubDTO;
    }

    @GetMapping("/deletePub")	
    public ModelAndView delete(@RequestParam String dato) {

        log.info("ClienteRestController - findAll: Mostramos todos los clientes");

        PublicacionDTO publicacionDTO=new PublicacionDTO();
        publicacionDTO.setId(Integer.parseInt(dato));
        publicacionService.delete(publicacionDTO);
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("../static/publicaciones.html");
        return modelAndView;

    }
}
