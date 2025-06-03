package com.example.springboot_app.model.dto;

import lombok.Data;

@Data
public class ArchivoDTO {
    private Long id;
    private String nombre;
    private String url;
    private String tipo; // Por ejemplo: "imagen", "documento", "video", etc.
    private byte[] contenido; // Contenido del archivo
    private Long publicacionId; // Referencia a la publicación a la que pertenece
}
