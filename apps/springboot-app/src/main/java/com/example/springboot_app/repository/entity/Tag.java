package com.example.springboot_app.repository.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "tag", schema = "pfc-bbdd", catalog = "")
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String nombre;

    @ManyToMany(mappedBy = "tags")
    private Set<Publicacion> publicaciones = new HashSet<>();
}
