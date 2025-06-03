package com.example.springboot_app.repository.dao;

import com.example.springboot_app.repository.entity.Publicacion;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public interface PublicacionRepository extends JpaRepository<Publicacion, Long> {
    
    @Query("SELECT p FROM Publicacion p JOIN p.tags t WHERE t.id = :tagId")
    List<Publicacion> findByTagsId(@Param("tagId") Long tagId);
}
