package com.example.springboot_app.service;

import com.example.springboot_app.model.dto.PublicacionDTO;
import com.example.springboot_app.repository.dao.PublicacionRepository;
import com.example.springboot_app.repository.entity.Publicacion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PublicacionServiceImpl implements PublicacionService{

    private static final Logger log = LoggerFactory.getLogger(PublicacionServiceImpl.class);

    @Autowired
    private PublicacionRepository publicacionRepository;
    @Override
    public List<PublicacionDTO> findAll() {
        log.info("DepartamentoServiceImpl - findAll: Lista de todos los Publicaciones");
        List<PublicacionDTO> listaPublicacionesDTO = publicacionRepository.findAll()
                .stream()
                .map(p->PublicacionDTO.convertToDTO(p)) //////////////////////??????????????
                .collect(Collectors.toList());

        return listaPublicacionesDTO;
    }

    @Override
    public void delete(PublicacionDTO publicacionDTO) {
        log.info("DepartamentoServiceImpl - delete: Borramos el cliente: " +
                publicacionDTO.getId());

        Publicacion publicacion = new Publicacion();
        publicacion.setId(publicacionDTO.getId());
        publicacionRepository.delete(publicacion);
    }
}

