package com.example.springboot_app.service;

import com.example.springboot_app.model.dto.TagDTO;
import com.example.springboot_app.repository.dao.TagRepository;
import com.example.springboot_app.repository.entity.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TagServiceImpl implements TagService {

    private static final Logger log = LoggerFactory.getLogger(TagServiceImpl.class);
    
    private final TagRepository tagRepository;

    public TagServiceImpl(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TagDTO> findAll() {
        log.info("Obteniendo todas las etiquetas");
        return tagRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TagDTO> findByNombreContaining(String nombre) {
        log.info("Buscando etiquetas que contengan: {}", nombre);
        return tagRepository.findByNombreContainingIgnoreCase(nombre).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TagDTO> findByPublicacionId(Long publicacionId) {
        log.info("Buscando etiquetas para la publicación con ID: {}", publicacionId);
        return tagRepository.findByPublicacionesId(publicacionId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private TagDTO convertToDTO(Tag tag) {
        if (tag == null) {
            return null;
        }
        TagDTO dto = new TagDTO();
        dto.setId(tag.getId());
        dto.setNombre(tag.getNombre());
        return dto;
    }
}
