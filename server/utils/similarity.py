import math

def cosine_similarity(vet_a, vet_b):
    if len(vet_a) != len(vet_b):
        return

    sum, norm_a, norm_b = 0, 0 ,0
    for i in range(len(vet_a)):
        sum+=vet_a[i]*vet_b[i]

        norm_a += vet_a[i]**2
        norm_b += vet_b[i]**2
    
    return (sum/(math.sqrt(norm_a)* math.sqrt(norm_b)))
