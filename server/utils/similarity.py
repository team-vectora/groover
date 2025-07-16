import math

def cosine_similarity(vet_a, vet_b):
    if len(vet_a) != len(vet_b):
        return 0

    sum_prod, norm_a, norm_b = 0, 0, 0
    for i in range(len(vet_a)):
        sum_prod += vet_a[i] * vet_b[i]
        norm_a += vet_a[i] ** 2
        norm_b += vet_b[i] ** 2

    denom = math.sqrt(norm_a) * math.sqrt(norm_b)
    if denom == 0:
        return 0

    return sum_prod / denom