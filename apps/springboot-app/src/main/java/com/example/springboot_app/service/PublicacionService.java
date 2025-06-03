package com.example.springboot_app.service;

import com.example.springboot_app.model.dto.PublicacionDTO;

import java.util.List;
import java.util.Optional;

public interface PublicacionService {
    List<PublicacionDTO> findAll();
    
    Optional<PublicacionDTO> findById(Long id);
    
    PublicacionDTO save(PublicacionDTO publicacionDTO);
    
    void delete(PublicacionDTO publicacionDTO);
    
    List<PublicacionDTO> findByTag(String tagNombre);
}
