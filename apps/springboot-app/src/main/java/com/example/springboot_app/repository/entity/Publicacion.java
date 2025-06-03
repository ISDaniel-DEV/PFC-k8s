package com.example.springboot_app.repository.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Entity
@Table(name = "publicacion", schema = "pfc-bbdd", catalog = "")
public class Publicacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_autor", nullable = false)
    private Long idAutor;

    @Column
    private String nombre;

    @Column
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column
    private String archivo;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "publicacion_tag",
        joinColumns = @JoinColumn(name = "publicacion_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();
    
    @OneToMany(mappedBy = "publicacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Archivo> archivos = new ArrayList<>();
    
    // Métodos de utilidad para manejar la relación bidireccional
    public void addTag(Tag tag) {
        this.tags.add(tag);
        tag.getPublicaciones().add(this);
    }
    
    public void removeTag(Tag tag) {
        this.tags.remove(tag);
        tag.getPublicaciones().remove(this);
    }
    
    // Métodos para manejar la relación con Archivo
    public void addArchivo(Archivo archivo) {
        archivos.add(archivo);
        archivo.setPublicacion(this);
    }
    
    public void removeArchivo(Archivo archivo) {
        archivos.remove(archivo);
        archivo.setPublicacion(null);
    }
}
