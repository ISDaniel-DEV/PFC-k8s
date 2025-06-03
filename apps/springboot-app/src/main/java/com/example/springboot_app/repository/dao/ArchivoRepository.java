package com.example.springboot_app.repository.dao;

import com.example.springboot_app.repository.entity.Archivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ArchivoRepository extends JpaRepository<Archivo, Long> {
    List<Archivo> findByPublicacionId(Long publicacionId);
    
    @Transactional
    @Modifying
    @Query("DELETE FROM Archivo a WHERE a.publicacion.id = :publicacionId")
    void deleteByPublicacionId(@Param("publicacionId") Long publicacionId);
}
