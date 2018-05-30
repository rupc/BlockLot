// Gamma distribution
// k > 0		shape parameter
// θ (Theta) > 0	scale parameter

package main

import (
	"fmt"
	"math"
)

var Γ = math.Gamma

//Lower incomplete Gamma function
func Iγ(s, x float64) float64 {
	if s < 0 {
		return 1
	}
	return IGam(s, x) * Γ(s)
}
// Cumulative distribution function, analytic solution, did not pass some tests!
func Gamma_CDF(k float64, θ float64) func(x float64) float64 {
	return func(x float64) float64 {
		if k < 0 || θ < 0 {
			panic(fmt.Sprintf("k < 0 || θ < 0"))
		}
		if x < 0 {
			return 0
		}
		return Iγ(k, x/θ) / Γ(k)
	}
}

// Value of the cumulative distribution function at x
func Gamma_CDF_At(k, θ, x float64) float64 {
	cdf := Gamma_CDF(k, θ)
	return cdf(x)
}

// Incomplete Gamma functions 
// from Cephes Math Library Release 2.8:  June, 2000
// Copyright 1985, 1987, 2000 by Stephen L. Moshier


// Complemented incomplete gamma integral
// The function is defined by
//
//
//  IGamC(a,x)   =   1 - IGam(a,x)
//
//                            inf.
//                              -
//                     1       | |  -t  a-1
//               =   -----     |   e   t   dt.
//                    -      | |
//                   | (a)    -
//                             x
//
//
// In this implementation both arguments must be positive.
// The integral is evaluated by either a power series or
// continued fraction expansion, depending on the relative
// values of a and x.
//
// ACCURACY:
//
// Tested at random a, x.
//                a         x                      Relative error:
// arithmetic   domain   domain     # trials      peak         rms
//    IEEE     0.5,100   0,100      200000       1.9e-14     1.7e-15
//    IEEE     0.01,0.5  0,100      200000       1.4e-13     1.6e-15

const (
	MACHEP float64 = 1.11022302462515654042e-16
	MAXLOG float64 = 7.08396418532264106224e2
	big    float64 = 4.503599627370496e15
	biginv float64 = 2.22044604925031308085e-16
)

func IGamC(a, x float64) float64 {
	var ans, ax, c, yc, r, t, y, z, pk, pkm1, pkm2, qk, qkm1, qkm2 float64

	if x <= 0 || a <= 0 {
		return 1.0
	}

	if x < 1.0 || x < a {
		return 1.0 - IGam(a, x)
	}
	ax = a*math.Log(x) - x - LnΓ(a)
	if ax < -MAXLOG {
		panic("IGamC: UNDERFLOW")
		return 0.0
	}
	ax = math.Exp(ax)

	/* continued fraction */
	y = 1.0 - a
	z = x + y + 1.0
	c = 0.0
	pkm2 = 1.0
	qkm2 = x
	pkm1 = x + 1.0
	qkm1 = z * x
	ans = pkm1 / qkm1

	for t > MACHEP {
		c += 1.0
		y += 1.0
		z += 2.0
		yc = y * c
		pk = pkm1*z - pkm2*yc
		qk = qkm1*z - qkm2*yc
		if qk != 0 {
			r = pk / qk
			t = math.Abs((ans - r) / r)
			ans = r
		} else {
			t = 1.0
		}
		pkm2 = pkm1
		pkm1 = pk
		qkm2 = qkm1
		qkm1 = qk
		if math.Abs(pk) > big {
			pkm2 *= biginv
			pkm1 *= biginv
			qkm2 *= biginv
			qkm1 *= biginv
		}
	}
	return (ans * ax)
}

// Incomplete gamma integral
// The function is defined by
//
//                           x
//                            -
//                   1       | |  -t  a-1
//  IGam(a,x)  =   -----     |   e   t   dt.
//                  -      | |
//                 | (a)    -
//                           0
//
//
// In this implementation both arguments must be positive.
// The integral is evaluated by either a power series or
// continued fraction expansion, depending on the relative
// values of a and x.
//
// ACCURACY:
//
//                      Relative error:
// arithmetic   domain     # trials      peak         rms
//    IEEE      0,30       200000       3.6e-14     2.9e-15
//    IEEE      0,100      300000       9.9e-14     1.5e-14
//
// left tail of incomplete gamma function:
//
//          inf.      k
//   a  -x   -       x
//  x  e     >   ----------
//           -     -
//          k=0   | (a+k+1)
//

func IGam(a, x float64) float64 {
	var ans, ax, c, r float64

	if x <= 0 || a <= 0 {
		return 0.0
	}
	if x > 1.0 && x > a {
		return 1.0 - IGamC(a, x)
	}
	// Compute  x**a * exp(-x) / gamma(a)
	ax = a*math.Log(x) - x - LnΓ(a)
	if ax < -MAXLOG {
		panic("IGam: UNDERFLOW")
		return 0.0
	}
	ax = math.Exp(ax)

	// power series
	r = a
	c = 1.0
	ans = 1.0

	for c/ans > MACHEP {
		r += 1.0
		c *= x / r
		ans += c
	}

	return ans * ax / a
}

var logsqrt2pi = math.Log(math.Sqrt(2 * math.Pi))
//Natural logarithm of the Gamma function
func LnΓ(x float64) (res float64) {
	res = (x-0.5)*math.Log(x+4.5) - (x + 4.5)
	res += logsqrt2pi
	res += math.Log1p(
		76.1800917300/(x+0) - 86.5053203300/(x+1) +
			24.0140982200/(x+2) - 1.23173951600/(x+3) +
			0.00120858003/(x+4) - 0.00000536382/(x+5))

	return
}

const π = float64(math.Pi)
const ln2 = math.Ln2
const lnSqrt2π = 0.918938533204672741780329736406 // log(sqrt(2*pi))
const min64 = math.SmallestNonzeroFloat64         //   DBL_MIN
const eps64 = 1.1102230246251565e-16              // DBL_EPSILON   
const maxExp = 1024.0                             // DBL_MAX_EXP
const sqrt2 = math.Sqrt2
const lnSqrtπd2 = 0.225791352644727432363097614947 // log(sqrt(pi/2))  M_LN_SQRT_PId2

var nan = math.NaN()

var fZero float64 = float64(0.0)
var fOne float64 = float64(1.0)
var iZero int64 = int64(0)
var iOne int64 = int64(1)

var negInf float64 = math.Inf(-1)
var posInf float64 = math.Inf(+1)

// Functions imported from "math"
var abs func(float64) float64 = math.Abs
var floor func(float64) float64 = math.Floor
var ceil func(float64) float64 = math.Ceil
var log func(float64) float64 = math.Log
var log1p func(float64) float64 = math.Log1p
var exp func(float64) float64 = math.Exp
var sqrt func(float64) float64 = math.Sqrt
var pow func(float64, float64) float64 = math.Pow
var atan func(float64) float64 = math.Atan
var tan func(float64) float64 = math.Tan
var sin func(float64) float64 = math.Sin
var trunc func(float64) float64 = math.Trunc
var erf func(float64) float64 = math.Erf
var erfc func(float64) float64 = math.Erfc
var isNaN func(float64) bool = math.IsNaN
var isInf func(float64, int) bool = math.IsInf
var fmod func(float64, float64) float64 = math.Mod

var GammaF = math.Gamma
var sqrt2pi = math.Sqrt(2 * math.Pi)

var lanczos_coef []float64 = []float64{
	0.99999999999980993,
	676.5203681218851,
	-1259.1392167224028,
	771.32342877765313,
	-176.61502916214059,
	12.507343278686905,
	-0.13857109526572012,
	9.9843695780195716e-6,
	1.5056327351493116e-7}

func isOdd(k float64) bool {
	if k != 2*floor(k/2.0) {
		return true
	}
	return false
}

func isInt(x float64) bool {
	if abs((x)-floor((x)+0.5)) <= 1e-7 {
		return true
	}
	return false
}

// Round to nearest integer
func Round(x float64) float64 {
	var i float64
	f := math.Floor(x)
	c := math.Ceil(x)
	if x-f < c-x {
		i = f
	} else {
		i = c
	}
	return i
}
