
package com.awholenewword.api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "examples")
public class Example {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "sentence_en",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String sentenceEn;

    @Column(
            name = "sentence_pt",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String sentencePt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    // Construtor exigido pelo JPA
    public Example() {
    }

    // Getters

    public Long getId() {
        return id;
    }

    public String getSentenceEn() {
        return sentenceEn;
    }

    public String getSentencePt() {
        return sentencePt;
    }

    public Word getWord() {
        return word;
    }

    // Setters

    public void setSentenceEn(String sentenceEn) {
        this.sentenceEn = sentenceEn;
    }

    public void setSentencePt(String sentencePt) {
        this.sentencePt = sentencePt;
    }

    public void setWord(Word word) {
        this.word = word;
    }
}
