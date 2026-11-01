
package com.awholenewword.api.controller;

import com.awholenewword.api.dto.WordResponse;
import com.awholenewword.api.service.WordService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/words")
@CrossOrigin(origins = "*", methods = RequestMethod.GET)
public class WordController {

    private final WordService wordService;

    public WordController(WordService wordService) {
        this.wordService = wordService;
    }

    @GetMapping("/{word}")
    public WordResponse findByWord(@PathVariable String word) {
        return wordService.findByWord(word);
    }

    @GetMapping("/todaysWord")
    public WordResponse findRandomWord() {
        return wordService.findRandomWord();
    }
}
