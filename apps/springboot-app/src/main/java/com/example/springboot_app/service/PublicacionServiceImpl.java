package com.example.springboot_app.service;

import com.example.springboot_app.model.dto.ArchivoDTO;
import com.example.springboot_app.model.dto.PublicacionDTO;
import com.example.springboot_app.repository.dao.PublicacionRepository;
import com.example.springboot_app.repository.dao.TagRepository;
import com.example.springboot_app.repository.entity.Publicacion;
import com.example.springboot_app.repository.entity.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PublicacionServiceImpl implements PublicacionService {

    private static final Logger log = LoggerFactory.getLogger(PublicacionServiceImpl.class);

    private final PublicacionRepository publicacionRepository;
    private final TagRepository tagRepository;
    private final ArchivoService archivoService;

    public PublicacionServiceImpl(PublicacionRepository publicacionRepository, 
                                TagRepository tagRepository,
                                ArchivoService archivoService) {
        this.publicacionRepository = publicacionRepository;
        this.tagRepository = tagRepository;
        this.archivoService = archivoService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicacionDTO> findAll() {
        log.info("PublicacionServiceImpl - findAll: Lista de todas las publicaciones");
        return publicacionRepository.findAll()
                .stream()
                .map(PublicacionDTO::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PublicacionDTO> findById(Long id) {
        log.info("PublicacionServiceImpl - findById: Buscando publicación con id: {}", id);
        return publicacionRepository.findById(id)
                .map(PublicacionDTO::convertToDTO);
    }

    @Override
    @Transactional
    public PublicacionDTO save(PublicacionDTO publicacionDTO) {
        log.info("PublicacionServiceImpl - save: Guardando publicación: {}", publicacionDTO);
        
        Publicacion publicacion = PublicacionDTO.convertToEntity(publicacionDTO);
        
        // Manejar las etiquetas
        if (publicacionDTO.getTags() != null && !publicacionDTO.getTags().isEmpty()) {
            Set<Tag> tags = new HashSet<>();
            
            for (String nombreTag : publicacionDTO.getTags()) {
                Tag tag = tagRepository.findByNombre(nombreTag)
                    .orElseGet(() -> {
                        Tag nuevoTag = new Tag();
                        nuevoTag.setNombre(nombreTag);
                        return tagRepository.save(nuevoTag);
                    });
                tags.add(tag);
            }
            
            publicacion.setTags(tags);
        }
        
        // Guardar la publicación primero para obtener el ID
        Publicacion publicacionGuardada = publicacionRepository.save(publicacion);
        
        // Manejar los archivos si existen
        if (publicacionDTO.getArchivos() != null && !publicacionDTO.getArchivos().isEmpty()) {
            // Eliminar archivos existentes si los hay
            archivoService.deleteByPublicacionId(publicacionGuardada.getId());
            
            // Guardar los nuevos archivos
            for (ArchivoDTO archivoDTO : publicacionDTO.getArchivos()) {
                archivoService.save(archivoDTO, publicacionGuardada);
            }
            
            // Recargar la publicación con los archivos
            publicacionGuardada = publicacionRepository.findById(publicacionGuardada.getId())
                .orElse(publicacionGuardada);
        }
        
        return PublicacionDTO.convertToDTO(publicacionGuardada);
    }

    @Override
    @Transactional
    public void delete(PublicacionDTO publicacionDTO) {
        log.info("PublicacionServiceImpl - delete: Borrando publicación con id: {}", publicacionDTO.getId());
        // Primero eliminamos los archivos asociados
        archivoService.deleteByPublicacionId(publicacionDTO.getId());
        // Luego eliminamos la publicación
        publicacionRepository.deleteById(publicacionDTO.getId());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PublicacionDTO> findByTag(String tagNombre) {
        log.info("PublicacionServiceImpl - findByTag: Buscando publicaciones con etiqueta: {}", tagNombre);
        return tagRepository.findByNombre(tagNombre)
                .map(tag -> publicacionRepository.findByTagsId(tag.getId()))
                .orElseGet(List::of)
                .stream()
                .map(PublicacionDTO::convertToDTO)
                .collect(Collectors.toList());
    }
}

