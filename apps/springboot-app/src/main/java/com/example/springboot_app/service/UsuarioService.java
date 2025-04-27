package com.example.springboot_app.service;

import com.example.springboot_app.model.dto.UsuarioDTO;

public interface UsuarioService {

    UsuarioDTO findById(UsuarioDTO usuarioDTO);
    UsuarioDTO findByEmail(UsuarioDTO usuarioDTO);
    void save(UsuarioDTO usuarioDTO);
    /*
     * List<UsuarioDTO> findByIdDep(UsuarioDTO usuarioDTO);
     */
    
}
