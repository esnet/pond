## Time

Pond is a library for handling time related structures, so the most basic of elements is time itself. Pond doesn't wrap any specific representation. Instead constructors of other primitives will generally accept either:

 * ms since UNIX epoch
 * a Javascript Date object
 * a Moment.

