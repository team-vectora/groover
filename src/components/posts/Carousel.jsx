'use client';
import React from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { DotButton, useDotButton } from './CarouselDot';

const Carousel = ({ slides = [], options = {} }) => {
  // Aqui você pode forçar uma margem negativa para mostrar parte do próximo slide
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start', // começa à esquerda
    containScroll: 'trimSnaps',
    dragFree: false,
    ...options,
  });

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

  if (!slides.length) return null;

  return (
    <section className="embla w-full relative overflow-hidden">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container flex gap-4">
          {slides.map((slide, index) => {
            const src = typeof slide === 'string' ? slide : slide.src;
            const alt = typeof slide === 'string' ? `Slide ${index + 1}` : slide.alt || `Slide ${index + 1}`;

            return (
              <div
                className="embla__slide relative flex-shrink-0 w-[80%] md:w-[70%]"
                key={index}
              >
                <div className="relative w-full aspect-[16/9]">
                  {src ? (
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      className="object-contain rounded-lg"
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

      <div className="embla__controls flex justify-center mt-4">
        <div className="flex gap-2">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot'.concat(
                index === selectedIndex ? ' embla__dot--selected' : ''
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Carousel;
