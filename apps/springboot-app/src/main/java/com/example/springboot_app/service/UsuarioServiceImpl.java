package com.example.springboot_app.service;

import com.example.springboot_app.model.dto.UsuarioDTO;
import com.example.springboot_app.repository.dao.UsuarioRepository;
import com.example.springboot_app.repository.entity.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioServiceImpl.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    public UsuarioDTO findById(UsuarioDTO usuarioDTO) {
        log.info("ClienteServiceImpl - findById: Buscar cliente por id: " +
                usuarioDTO.getId());

        Optional<Usuario> usuario = usuarioRepository.findById(usuarioDTO.getId());
        if (usuario.isPresent()) {
            usuarioDTO = UsuarioDTO.convertToDTO(usuario.get());
            return usuarioDTO;
        } else {
            return null;
        }
    }

    @Override
    public UsuarioDTO findByEmail(UsuarioDTO usuarioDTO) {
        log.info("ClienteServiceImpl - findById: Buscar cliente por id: " +
                usuarioDTO.getEmail());

        Optional<Usuario> usuario = usuarioRepository.findUsuario(usuarioDTO.getEmail());
        if (usuario.isPresent()) {
            usuarioDTO = UsuarioDTO.convertToDTO(usuario.get());
            log.info(String.valueOf(usuarioDTO));
            return usuarioDTO;
        } else {
            return null;
        }
    }

    @Override
    public void save(UsuarioDTO usuarioDTO) {
        log.info("ClienteServiceImpl - save: Guardar cliente: " +
                usuarioDTO.toString());

        Usuario usuario = UsuarioDTO.convertToEntity(usuarioDTO);
        usuarioRepository.save(usuario);
    }

    /*
     * @Override
     * public List<UsuarioDTO> findByDep(UsuarioDTO usuarioDTO) {
     * log.info("ClienteServiceImpl - findById: Buscar cliente por id: " +
     * usuarioDTO.getId());
     * 
     * List<UsuarioDTO> listaUsuarioDTO =
     * usuarioRepository.findDep(usuarioDTO.getIdDepart())
     * .stream()
     * .map(p -> UsuarioDTO.convertToDTO(p))
     * .collect(Collectors.toList());
     * 
     * return listaUsuarioDTO;
     * 
     * }
     */

}
