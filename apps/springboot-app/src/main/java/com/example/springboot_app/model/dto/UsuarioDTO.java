package com.example.springboot_app.model.dto;

import com.example.springboot_app.repository.entity.Usuario;
import lombok.Data;

@Data
public class UsuarioDTO {

    private int id;

    private String nombre;

    private String email;

    private String password;

    private int NPublicaciones;

    private String foto_perfil;

    private String foto_banner;

    public static Usuario convertToEntity (UsuarioDTO usuarioDTO) {
        Usuario usuario=new Usuario();
        usuario.setId(usuarioDTO.getId());
        usuario.setNombre(usuarioDTO.getNombre());
        usuario.setEmail(usuarioDTO.getEmail());
        usuario.setPassword(usuarioDTO.getPassword());
        usuario.setNPublicaciones(usuarioDTO.getNPublicaciones());  
        usuario.setFoto_perfil(usuarioDTO.getFoto_perfil());
        usuario.setFoto_banner(usuarioDTO.getFoto_banner());
        
        return usuario;
       }
    public static UsuarioDTO convertToDTO (Usuario usuario) {
        UsuarioDTO usuarioDTO=new UsuarioDTO();
        usuarioDTO.setId(usuario.getId());
        usuarioDTO.setNombre(usuario.getNombre());
        usuarioDTO.setEmail(usuario.getEmail());
        usuarioDTO.setPassword(usuario.getPassword());
        usuarioDTO.setNPublicaciones(usuario.getNPublicaciones());
        usuarioDTO.setFoto_perfil(usuario.getFoto_perfil());
        usuarioDTO.setFoto_banner(usuario.getFoto_banner());

        return usuarioDTO;
    }
}
