package com.example.springboot_app.model.dto;

import com.example.springboot_app.repository.entity.Publicacion;
import lombok.Data;

@Data
public class PublicacionDTO  {

    private int id;

    private int id_autor;

    private String nombre;

    private String titulo;

    private String descripcion;

    private String archivo;


    public static Publicacion convertToEntity (PublicacionDTO publicacionDTO) {
        Publicacion publicacion=new Publicacion();

        publicacion.setId(publicacionDTO.getId());
        publicacion.setId_autor(publicacionDTO.getId_autor());
        publicacion.setNombre(publicacionDTO.getNombre());
        publicacion.setTitulo(publicacionDTO.getTitulo());
        publicacion.setDescripcion(publicacionDTO.getDescripcion());
        publicacion.setArchivo(publicacionDTO.getArchivo());

        return publicacion;
    }
    public static PublicacionDTO convertToDTO (Publicacion publicacion) {
        PublicacionDTO departamentoDTO=new PublicacionDTO();

        departamentoDTO.setId(publicacion.getId());
        departamentoDTO.setId_autor(publicacion.getId_autor());
        departamentoDTO.setNombre(publicacion.getNombre());
        departamentoDTO.setTitulo(publicacion.getTitulo());
        departamentoDTO.setDescripcion(publicacion.getDescripcion());
        departamentoDTO.setArchivo(publicacion.getArchivo());

        return departamentoDTO;
    }
}
