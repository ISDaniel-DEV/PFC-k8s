package com.example.springboot_app.repository.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "publicacion", schema = "pfc-bbdd", catalog = "")
public class Publicacion {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    @Column(name = "id", nullable = true)
    private int id;

    @Basic
    @Column(name = "id_autor", nullable = true)
    private int id_autor;

    @Basic
    @Column(name = "nombre")
    private String nombre;

    @Basic
    @Column(name = "titulo")
    private String titulo;

    @Basic
    @Column(name = "descripcion")
    private String descripcion;

    @Basic
    @Column(name = "archivo")
    private String archivo;
}
