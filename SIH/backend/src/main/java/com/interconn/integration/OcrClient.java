package com.interconn.integration;

import com.interconn.entity.Evidence;

public interface OcrClient {

    OcrResult process(Evidence evidence);
}