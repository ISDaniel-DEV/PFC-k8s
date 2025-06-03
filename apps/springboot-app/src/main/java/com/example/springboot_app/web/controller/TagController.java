package com.example.springboot_app.web.controller;

import com.example.springboot_app.model.dto.TagDTO;
import com.example.springboot_app.service.TagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public ResponseEntity<List<TagDTO>> findAll() {
        return ResponseEntity.ok(tagService.findAll());
    }

    @GetMapping("/{nombre}")
    public ResponseEntity<List<TagDTO>> findByNombreContaining(@PathVariable String nombre) {
        return ResponseEntity.ok(tagService.findByNombreContaining(nombre));
    }
    
    @GetMapping("/publicacion/{publicacionId}")
    public ResponseEntity<List<TagDTO>> findByPublicacionId(@PathVariable Long publicacionId) {
        return ResponseEntity.ok(tagService.findByPublicacionId(publicacionId));
    }
}
