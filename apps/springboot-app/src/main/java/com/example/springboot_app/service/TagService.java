package com.example.springboot_app.service;

import com.example.springboot_app.model.dto.TagDTO;

import java.util.List;

public interface TagService {
    List<TagDTO> findAll();
    List<TagDTO> findByNombreContaining(String nombre);
    List<TagDTO> findByPublicacionId(Long publicacionId);
}
