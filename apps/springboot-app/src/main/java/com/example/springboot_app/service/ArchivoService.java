package com.example.springboot_app.service;

import com.example.springboot_app.model.dto.ArchivoDTO;
import com.example.springboot_app.repository.dao.ArchivoRepository;
import com.example.springboot_app.repository.entity.Archivo;
import com.example.springboot_app.repository.entity.Publicacion;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArchivoService {

    private final ArchivoRepository archivoRepository;

    public ArchivoService(ArchivoRepository archivoRepository) {
        this.archivoRepository = archivoRepository;
    }

    @Transactional(readOnly = true)
    public List<ArchivoDTO> findByPublicacionId(Long publicacionId) {
        return archivoRepository.findByPublicacionId(publicacionId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ArchivoDTO save(ArchivoDTO archivoDTO, Publicacion publicacion) {
        Archivo archivo = convertToEntity(archivoDTO);
        archivo.setPublicacion(publicacion);
        return convertToDTO(archivoRepository.save(archivo));
    }

    @Transactional
    public void deleteByPublicacionId(Long publicacionId) {
        archivoRepository.deleteByPublicacionId(publicacionId);
    }

    private ArchivoDTO convertToDTO(Archivo archivo) {
        ArchivoDTO dto = new ArchivoDTO();
        dto.setId(archivo.getId());
        dto.setNombre(archivo.getNombre());
        dto.setUrl(archivo.getUrl());
        dto.setTipo(archivo.getTipo());
        dto.setPublicacionId(archivo.getPublicacion().getId());
        return dto;
    }

    private Archivo convertToEntity(ArchivoDTO dto) {
        Archivo archivo = new Archivo();
        archivo.setId(dto.getId());
        archivo.setNombre(dto.getNombre());
        archivo.setUrl(dto.getUrl());
        archivo.setTipo(dto.getTipo());
        // La relación con Publicacion se establece en el servicio
        return archivo;
    }
}
