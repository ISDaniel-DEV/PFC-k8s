package com.example.springboot_app.web.controller;

import com.example.springboot_app.model.dto.PublicacionDTO;
import com.example.springboot_app.model.dto.ArchivoDTO;
import com.example.springboot_app.repository.entity.Publicacion;
import com.example.springboot_app.service.PublicacionService;
import com.example.springboot_app.service.ArchivoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;
import java.util.Set;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/publicaciones")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class PublicacionController {

    private static final Logger log = LoggerFactory.getLogger(PublicacionController.class);
    private final PublicacionService publicacionService;
    private final ArchivoService archivoService;

    public PublicacionController(PublicacionService publicacionService, ArchivoService archivoService) {
        this.publicacionService = publicacionService;
        this.archivoService = archivoService;
    }

    @GetMapping
    public ResponseEntity<List<PublicacionDTO>> findAll() {
        log.info("PublicacionController - findAll: Obteniendo todas las publicaciones");
        return ResponseEntity.ok(publicacionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicacionDTO> findById(@PathVariable Long id) {
        log.info("PublicacionController - findById: Buscando publicación con id: {}", id);
        return publicacionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PublicacionDTO> create(
            @RequestPart(value = "publicacion", required = false) String publicacionJson,
            @RequestParam(value = "titulo", required = false) String titulo,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "idAutor", required = false) Long idAutor,
            @RequestParam(value = "nombre", required = false) String nombre,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestPart(value = "portada", required = false) MultipartFile portada,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestPart(value = "archivos", required = false) List<MultipartFile> archivos) {
        
        log.info("PublicacionController - create: Creando nueva publicación");
        
        try {
            PublicacionDTO publicacionDTO;
            
            // Handle both JSON and form-data formats
            if (publicacionJson != null && !publicacionJson.isEmpty()) {
                // JSON format
                ObjectMapper objectMapper = new ObjectMapper();
                publicacionDTO = objectMapper.readValue(publicacionJson, PublicacionDTO.class);
            } else if (titulo != null && descripcion != null && idAutor != null) {
                // Form-data format
                publicacionDTO = new PublicacionDTO();
                publicacionDTO.setTitulo(titulo);
                publicacionDTO.setDescripcion(descripcion);
                publicacionDTO.setIdAutor(idAutor);
                publicacionDTO.setNombre(nombre);
                
                if (tags != null && !tags.isEmpty()) {
                    publicacionDTO.setTags(Set.of(tags.split(",")));
                }
                
                // Process cover image if present
                if (portada != null && !portada.isEmpty()) {
                    String nombreArchivo = "portada-" + System.currentTimeMillis() + "-" + portada.getOriginalFilename();
                    String rutaPortada = "/uploads/portadas/" + nombreArchivo;
                    
                    // TODO: Implement file storage
                    // fileStorageService.save(portada, rutaPortada);
                    
                    publicacionDTO.setArchivo(rutaPortada);
                }
                
                // Combine both files and archivos if needed
                List<MultipartFile> allFiles = new ArrayList<>();
                if (files != null) allFiles.addAll(files);
                if (archivos != null) allFiles.addAll(archivos);
                files = allFiles.isEmpty() ? null : allFiles;
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            log.info("Publicacion recibida: {}", publicacionDTO);
            
            // Handle file uploads if any
            if (files != null && !files.isEmpty()) {
                log.info("Número de archivos recibidos: {}", files.size());
                List<ArchivoDTO> archivosDTO = new ArrayList<>();
                
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        try {
                            String nombreArchivo = "archivo-" + System.currentTimeMillis() + "-" + file.getOriginalFilename();
                            String rutaArchivo = "/uploads/publicaciones/" + nombreArchivo;
                            
                            // TODO: Implement file storage
                            // fileStorageService.save(file, rutaArchivo);
                            
                            ArchivoDTO archivoDTO = new ArchivoDTO();
                            archivoDTO.setNombre(file.getOriginalFilename());
                            archivoDTO.setUrl(rutaArchivo);
                            archivoDTO.setTipo(file.getContentType());
                            archivoDTO.setContenido(file.getBytes());
                            
                            archivosDTO.add(archivoDTO);
                        } catch (Exception e) {
                            log.error("Error al procesar archivo: " + file.getOriginalFilename(), e);
                        }
                    }
                }
                
                if (!archivosDTO.isEmpty()) {
                    publicacionDTO.setArchivos(archivosDTO);
                }
            }
            
            // Save the publication
            PublicacionDTO savedPublicacion = publicacionService.save(publicacionDTO);
            
            // If we have files, associate them with the saved publication
            if (savedPublicacion.getArchivos() != null && !savedPublicacion.getArchivos().isEmpty()) {
                Publicacion publicacion = new Publicacion();
                publicacion.setId(savedPublicacion.getId());
                
                for (ArchivoDTO archivoDTO : savedPublicacion.getArchivos()) {
                    archivoService.save(archivoDTO, publicacion);
                }
                
                // Reload the publication with all relationships
                savedPublicacion = publicacionService.findById(savedPublicacion.getId())
                    .orElse(savedPublicacion);
            }
            
            return new ResponseEntity<>(savedPublicacion, HttpStatus.CREATED);
            
        } catch (Exception e) {
            log.error("Error al procesar la publicación: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("PublicacionController - delete: Eliminando publicación con id: {}", id);
        PublicacionDTO publicacionDTO = new PublicacionDTO();
        publicacionDTO.setId(id);
        publicacionService.delete(publicacionDTO);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/etiqueta/{tag}")
    public ResponseEntity<List<PublicacionDTO>> findByTag(@PathVariable String tag) {
        log.info("PublicacionController - findByTag: Buscando publicaciones con etiqueta: {}", tag);
        return ResponseEntity.ok(publicacionService.findByTag(tag));
    }
    
    // Mantenemos el endpoint original para compatibilidad con el frontend existente
    @GetMapping("/deletePub")
    public ModelAndView deleteLegacy(@RequestParam String dato) {
        log.info("PublicacionController - deleteLegacy: Eliminando publicación (legacy)");
        PublicacionDTO publicacionDTO = new PublicacionDTO();
        publicacionDTO.setId(Long.parseLong(dato));
        publicacionService.delete(publicacionDTO);
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("../static/publicaciones.html");
        return modelAndView;
    }
}
