package com.example.springboot_app.repository.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "usuario", schema = "pfc-bbdd", catalog = "")
public class Usuario {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    @Column(name = "id", nullable = true)
    private int id;
    
    @Basic
    @Column(name = "nombre", nullable = true, length = 50)
    private String nombre;

    @Basic
    @Column(name = "email", nullable = true, length = 50)
    private String email;

    @Basic
    @Column(name = "password", nullable = true, length = 50)
    private String password;

    @Basic
    @Column(name = "NPublicaciones", nullable = true)
    private int NPublicaciones;

    @Basic
    @Column(name= "foto_perfil")
    private String foto_perfil;

    @Basic
    @Column(name= "foto_banner")
    private String foto_banner;

    @Basic
    @Column(name= "primera_vez")
    private Boolean primera_vez;
}
