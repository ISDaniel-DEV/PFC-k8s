package com.example.springboot_app.repository.dao;

import com.example.springboot_app.repository.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByNombre(String nombre);
    
    List<Tag> findByNombreContainingIgnoreCase(String nombre);
    
    List<Tag> findByPublicacionesId(Long publicacionId);
}
