package com.example.springboot_app.service;

import com.example.springboot_app.model.dto.PublicacionDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PublicacionService {

    List<PublicacionDTO> findAll();
    void delete(PublicacionDTO publicacionDTO);

}
