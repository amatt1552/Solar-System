# JSON Comments
Galaxy type goes from 0 - 3.
0 = Spiral
1 = Elliptical
2 = Lenticular
3 = Irregular
Galaxy type will likely change the image selected when displaying galaxies.
positions for galaxy and solar system determine where they will be displayed on the selection screens.

IDs should be auto generated. 
galaxy id: g[generated number] | eg: g0
solar system id: [owning galaxy id]_s[generated number] | eg: g0_s0
planet id: [owning galaxy id]_[owning solar system id]_p[generated number] | eg: g0_s0_p0
moon id: [owning galaxy id]_[owning solar system id]_[owning planet id]_m[generated number] | eg: g0_s0_p0_m0

Suns currently only have 2 types to keep it simple. 
Its unlikely that red dwarf stars can support life but putting it here regardless.
0 = Yellow dwarf
1 = Red dwarf

Only 3 planet ring types come to mind at the moment.
0 = gassy ring
1 = asteroid ring
2 = custom