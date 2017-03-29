/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/**
 * Defines the interface for all event keys
 */
abstract class Key {
    abstract type(): string;
    abstract toJSON(): Object;
    abstract toString(): string;
    abstract timestamp(): Date;
    abstract begin(): Date;
    abstract end(): Date;
}

export default Key;
