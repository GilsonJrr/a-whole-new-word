
package com.awholenewword.api.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "words")
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String word;

    @Column(length = 100)
    private String phonetic;

    @Column(length = 50)
    private String type;

    @Column(name = "definition_pt", columnDefinition = "TEXT")
    private String definitionPt;

    @Column(name = "definition_en", columnDefinition = "TEXT")
    private String definitionEn;

    @OneToMany(
            mappedBy = "word",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Example> examples = new ArrayList<>();

    // Construtor exigido pelo JPA
    public Word() {
    }

    // Getters

    public Long getId() {
        return id;
    }

    public String getWord() {
        return word;
    }

    public String getPhonetic() {
        return phonetic;
    }

    public String getType() {
        return type;
    }

    public String getDefinitionPt() {
        return definitionPt;
    }

    public String getDefinitionEn() {
        return definitionEn;
    }

    public List<Example> getExamples() {
        return examples;
    }

    // Setters

    public void setWord(String word) {
        this.word = word;
    }

    public void setPhonetic(String phonetic) {
        this.phonetic = phonetic;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setDefinitionPt(String definitionPt) {
        this.definitionPt = definitionPt;
    }

    public void setDefinitionEn(String definitionEn) {
        this.definitionEn = definitionEn;
    }

    // Métodos de relacionamento

    public void addExample(Example example) {
        examples.add(example);
        example.setWord(this);
    }

    public void removeExample(Example example) {
        examples.remove(example);
        example.setWord(null);
    }
}
