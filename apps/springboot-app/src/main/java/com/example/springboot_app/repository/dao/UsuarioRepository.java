package com.example.springboot_app.repository.dao;

import com.example.springboot_app.repository.entity.Usuario;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    @Query(value = "SELECT * FROM usuario WHERE email = :idc", nativeQuery = true)
    public Optional<Usuario> findUsuario(@Param("idc") String nif);

    @Query(value = "SELECT * FROM usuario WHERE password = :idc1", nativeQuery = true)
    public List <Usuario> findDep(@Param("idc1") int dep);

    @Query(value = "INSERT INTO usuario (nombre, email, password, NPublicaciones, fotoPerfil, fotoBanner) VALUES (:nombre, :email, :password, :NPublicaciones, :foto_perfil, :foto_banner)", nativeQuery = true)
    public void insertUsuario(@Param("nombre") String nombre, @Param("email") String email, @Param("password") String password, @Param("NPublicaciones") int NPublicaciones, @Param("foto_perfil") String foto_perfil, @Param("foto_banner") String foto_banner);
    
    @Query(value = "UPDATE usuario SET nombre = :nombre, email = :email, password = :password, NPublicaciones = :NPublicaciones, foto_perfil = :foto_perfil, foto_banner = :foto_banner WHERE id = :id", nativeQuery = true)
    public void updateUsuario(@Param("id") int id, @Param("nombre") String nombre, @Param("email") String email, @Param("password") String password, @Param("NPublicaciones") int NPublicaciones, @Param("foto_perfil") String foto_perfil, @Param("foto_banner") String foto_banner);

}
