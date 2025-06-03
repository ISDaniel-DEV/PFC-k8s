package com.example.springboot_app.model.dto;

import com.example.springboot_app.repository.entity.Publicacion;
import com.example.springboot_app.repository.entity.Tag;
import lombok.Data;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
public class PublicacionDTO  {
    private Long id;
    private Long idAutor;
    private String nombre;
    private String titulo;
    private String descripcion;
    private String archivo;
    private Set<String> tags;
    private List<ArchivoDTO> archivos;

    public static Publicacion convertToEntity(PublicacionDTO publicacionDTO) {
        Publicacion publicacion = new Publicacion();
        publicacion.setId(publicacionDTO.getId());
        publicacion.setIdAutor(publicacionDTO.getIdAutor());
        publicacion.setNombre(publicacionDTO.getNombre());
        publicacion.setTitulo(publicacionDTO.getTitulo());
        publicacion.setDescripcion(publicacionDTO.getDescripcion());
        publicacion.setArchivo(publicacionDTO.getArchivo());
        
        // Los tags se manejarán por separado en el servicio
        
        // Los archivos se manejarán por separado en el servicio
        
        return publicacion;
    }
    
    public static PublicacionDTO convertToDTO(Publicacion publicacion) {
        PublicacionDTO dto = new PublicacionDTO();
        dto.setId(publicacion.getId());
        dto.setIdAutor(publicacion.getIdAutor());
        dto.setNombre(publicacion.getNombre());
        dto.setTitulo(publicacion.getTitulo());
        dto.setDescripcion(publicacion.getDescripcion());
        dto.setArchivo(publicacion.getArchivo());
        
        // Convertir los archivos a DTOs
        if (publicacion.getArchivos() != null) {
            List<ArchivoDTO> archivosDTO = publicacion.getArchivos().stream()
                .map(archivo -> {
                    ArchivoDTO archivoDTO = new ArchivoDTO();
                    archivoDTO.setNombre(archivo.getNombre());
                    archivoDTO.setUrl(archivo.getUrl());
                    return archivoDTO;
                })
                .collect(Collectors.toList());
            dto.setArchivos(archivosDTO);
        }
        
        // Convertir los tags a un conjunto de strings
        if (publicacion.getTags() != null) {
            Set<String> tagNombres = publicacion.getTags().stream()
                .map(Tag::getNombre)
                .collect(Collectors.toSet());
            dto.setTags(tagNombres);
        }
        
        return dto;
    }
}
