'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// Componente para o botão de bolinha (indicador de slide)
const DotButton = ({ selected, onClick }) => (
    <button
        className={`w-2.5 h-2.5 rounded-full mx-1 transition-colors duration-200 ${selected ? 'bg-accent' : 'bg-gray-500'}`}
        type="button"
        onClick={onClick}
    />
);

// Hook para gerenciar a navegação por bolinhas e estado do carrossel
const useDotButton = (emblaApi) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState([]);

    const onDotButtonClick = useCallback(
        (index) => {
            if (!emblaApi) return;
            emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    const onInit = useCallback((emblaApi) => {
        setScrollSnaps(emblaApi.scrollSnapList());
    }, []);

    const onSelect = useCallback((emblaApi) => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        onInit(emblaApi);
        onSelect(emblaApi);
        emblaApi.on('reInit', onInit);
        emblaApi.on('reInit', onSelect);
        emblaApi.on('select', onSelect);
    }, [emblaApi, onInit, onSelect]);

    return {
        selectedIndex,
        scrollSnaps,
        onDotButtonClick,
    };
};

const Carousel = ({ slides = [], options = {} }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'center',
        containScroll: 'trimSnaps',
        dragFree: false,
        ...options,
    });

    const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

    const scrollPrev = useCallback(() => {
        emblaApi?.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        emblaApi?.scrollNext();
    }, [emblaApi]);

    if (!slides.length) return null;

    return (
        <section className="relative w-full max-w-full mx-auto overflow-hidden group">
            <div className="embla__viewport border-1 border-primary rounded-lg" ref={emblaRef}>
                <div className="embla__container flex">
                    {slides.map((slide, index) => {
                        const src = typeof slide === 'string' ? slide : slide.src;
                        const alt = typeof slide === 'string' ? `Slide ${index + 1}` : slide.alt || `Slide ${index + 1}`;

                        return (
                            <div
                                className="embla__slide relative flex-shrink-0 w-full"
                                key={index}
                            >
                                <div className="relative w-full aspect-video bg-transparent rounded-lg overflow-hidden">
                                    {src ? (
                                        <Image
                                            src={src}
                                            alt={alt}
                                            fill
                                            className="object-contain"
                                            quality={100}
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="bg-gray-200 w-full h-full flex items-center justify-center rounded-lg">
                                            <span>Imagem não disponível</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Botões de navegação (visíveis ao hover) */}
            {slides.length > 1 && (
                <>
                    <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={scrollPrev}
                        aria-label="Previous slide"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={scrollNext}
                        aria-label="Next slide"
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </>
            )}

            {/* Indicadores de bolinha */}
            {slides.length > 1 && (
                <div className="flex justify-center mt-4">
                    {scrollSnaps.map((_, index) => (
                        <DotButton
                            key={index}
                            onClick={() => onDotButtonClick(index)}
                            selected={index === selectedIndex}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default Carousel;