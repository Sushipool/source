{
    "targets": [

        {
            "target_name": "nimiq_node",
            "sources": [
                "src/native/argon2.c",
                "src/native/blake2/blake2b.c",
                "src/native/core.c",
                "src/native/encoding.c",
                "src/native/nimiq_native.c",
                "src/native/opt.c",
                "src/native/sha256.c",
                "src/native/ed25519/collective.c",
                "src/native/ed25519/fe.c",
                "src/native/ed25519/ge.c",
                "src/native/ed25519/keypair.c",
                "src/native/ed25519/memory.c",
                "src/native/ed25519/sc.c",
                "src/native/ed25519/sha512.c",
                "src/native/ed25519/sign.c",
                "src/native/ed25519/verify.c",
                "src/native/nimiq_node.cc"
            ],
            "defines": [
                "ARGON2_NO_THREADS"
            ],
            "include_dirs": [
                "<!(node -e \"require('nan')\")",
                "src/native"
            ],
            "cflags_c": [
                "-std=c99",
                "-march=native"
            ],
            "xcode_settings": {
                "OTHER_CFLAGS": [
                    "-march=native"
                ]
            }
        },

        {
            "target_name": "nimiq_node_sandybridge",
            "sources": [
                "src/native/argon2.c",
                "src/native/blake2/blake2b.c",
                "src/native/core.c",
                "src/native/encoding.c",
                "src/native/nimiq_native.c",
                "src/native/opt.c",
                "src/native/sha256.c",
                "src/native/ed25519/collective.c",
                "src/native/ed25519/fe.c",
                "src/native/ed25519/ge.c",
                "src/native/ed25519/keypair.c",
                "src/native/ed25519/memory.c",
                "src/native/ed25519/sc.c",
                "src/native/ed25519/sha512.c",
                "src/native/ed25519/sign.c",
                "src/native/ed25519/verify.c",
                "src/native/nimiq_node.cc"
            ],
            "defines": [
                "ARGON2_NO_THREADS"
            ],
            "include_dirs": [
                "<!(node -e \"require('nan')\")",
                "src/native"
            ],
            "cflags_c": [
                "-std=c99",
                "-march=sandybridge",
                "-O3"
            ],
            "xcode_settings": {
                "OTHER_CFLAGS": [
                    "-march=sandybridge",
                    "-O3"
                ]
            }
        },

        {
            "target_name": "nimiq_node_ivybridge",
            "sources": [
                "src/native/argon2.c",
                "src/native/blake2/blake2b.c",
                "src/native/core.c",
                "src/native/encoding.c",
                "src/native/nimiq_native.c",
                "src/native/opt.c",
                "src/native/sha256.c",
                "src/native/ed25519/collective.c",
                "src/native/ed25519/fe.c",
                "src/native/ed25519/ge.c",
                "src/native/ed25519/keypair.c",
                "src/native/ed25519/memory.c",
                "src/native/ed25519/sc.c",
                "src/native/ed25519/sha512.c",
                "src/native/ed25519/sign.c",
                "src/native/ed25519/verify.c",
                "src/native/nimiq_node.cc"
            ],
            "defines": [
                "ARGON2_NO_THREADS"
            ],
            "include_dirs": [
                "<!(node -e \"require('nan')\")",
                "src/native"
            ],
            "cflags_c": [
                "-std=c99",
                "-march=ivybridge",
                "-O3"
            ],
            "xcode_settings": {
                "OTHER_CFLAGS": [
                    "-march=ivybridge",
                    "-O3"
                ]
            }
        },

        {
            "target_name": "nimiq_node_haswell",
            "sources": [
                "src/native/argon2.c",
                "src/native/blake2/blake2b.c",
                "src/native/core.c",
                "src/native/encoding.c",
                "src/native/nimiq_native.c",
                "src/native/opt.c",
                "src/native/sha256.c",
                "src/native/ed25519/collective.c",
                "src/native/ed25519/fe.c",
                "src/native/ed25519/ge.c",
                "src/native/ed25519/keypair.c",
                "src/native/ed25519/memory.c",
                "src/native/ed25519/sc.c",
                "src/native/ed25519/sha512.c",
                "src/native/ed25519/sign.c",
                "src/native/ed25519/verify.c",
                "src/native/nimiq_node.cc"
            ],
            "defines": [
                "ARGON2_NO_THREADS"
            ],
            "include_dirs": [
                "<!(node -e \"require('nan')\")",
                "src/native"
            ],
            "cflags_c": [
                "-std=c99",
                "-march=haswell",
                "-O3"
            ],
            "xcode_settings": {
                "OTHER_CFLAGS": [
                    "-march=haswell",
                    "-O3"
                ]
            }
        },

        {
            "target_name": "nimiq_node_broadwell",
            "sources": [
                "src/native/argon2.c",
                "src/native/blake2/blake2b.c",
                "src/native/core.c",
                "src/native/encoding.c",
                "src/native/nimiq_native.c",
                "src/native/opt.c",
                "src/native/sha256.c",
                "src/native/ed25519/collective.c",
                "src/native/ed25519/fe.c",
                "src/native/ed25519/ge.c",
                "src/native/ed25519/keypair.c",
                "src/native/ed25519/memory.c",
                "src/native/ed25519/sc.c",
                "src/native/ed25519/sha512.c",
                "src/native/ed25519/sign.c",
                "src/native/ed25519/verify.c",
                "src/native/nimiq_node.cc"
            ],
            "defines": [
                "ARGON2_NO_THREADS"
            ],
            "include_dirs": [
                "<!(node -e \"require('nan')\")",
                "src/native"
            ],
            "cflags_c": [
                "-std=c99",
                "-march=broadwell",
                "-O3"
            ],
            "xcode_settings": {
                "OTHER_CFLAGS": [
                    "-march=broadwell",
                    "-O3"
                ]
            }
        },

        {
            "target_name": "nimiq_node_skylake",
            "sources": [
                "src/native/argon2.c",
                "src/native/blake2/blake2b.c",
                "src/native/core.c",
                "src/native/encoding.c",
                "src/native/nimiq_native.c",
                "src/native/opt.c",
                "src/native/sha256.c",
                "src/native/ed25519/collective.c",
                "src/native/ed25519/fe.c",
                "src/native/ed25519/ge.c",
                "src/native/ed25519/keypair.c",
                "src/native/ed25519/memory.c",
                "src/native/ed25519/sc.c",
                "src/native/ed25519/sha512.c",
                "src/native/ed25519/sign.c",
                "src/native/ed25519/verify.c",
                "src/native/nimiq_node.cc"
            ],
            "defines": [
                "ARGON2_NO_THREADS"
            ],
            "include_dirs": [
                "<!(node -e \"require('nan')\")",
                "src/native"
            ],
            "cflags_c": [
                "-std=c99",
                "-march=skylake",
                "-O3"
            ],
            "xcode_settings": {
                "OTHER_CFLAGS": [
                    "-march=skylake",
                    "-O3"
                ]
            }
        },

        {
            "target_name": "nimiq_node_skylake_avx512",
            "sources": [
                "src/native/argon2.c",
                "src/native/blake2/blake2b.c",
                "src/native/core.c",
                "src/native/encoding.c",
                "src/native/nimiq_native.c",
                "src/native/opt.c",
                "src/native/sha256.c",
                "src/native/ed25519/collective.c",
                "src/native/ed25519/fe.c",
                "src/native/ed25519/ge.c",
                "src/native/ed25519/keypair.c",
                "src/native/ed25519/memory.c",
                "src/native/ed25519/sc.c",
                "src/native/ed25519/sha512.c",
                "src/native/ed25519/sign.c",
                "src/native/ed25519/verify.c",
                "src/native/nimiq_node.cc"
            ],
            "defines": [
                "ARGON2_NO_THREADS"
            ],
            "include_dirs": [
                "<!(node -e \"require('nan')\")",
                "src/native"
            ],
            "cflags_c": [
                "-std=c99",
                "-march=skylake-avx512",
                "-O3"
            ],
            "xcode_settings": {
                "OTHER_CFLAGS": [
                    "-march=skylake-avx512",
                    "-O3"
                ]
            }
        },

        {
            "target_name": "nimiq_node_znver1",
            "sources": [
                "src/native/argon2.c",
                "src/native/blake2/blake2b.c",
                "src/native/core.c",
                "src/native/encoding.c",
                "src/native/nimiq_native.c",
                "src/native/opt.c",
                "src/native/sha256.c",
                "src/native/ed25519/collective.c",
                "src/native/ed25519/fe.c",
                "src/native/ed25519/ge.c",
                "src/native/ed25519/keypair.c",
                "src/native/ed25519/memory.c",
                "src/native/ed25519/sc.c",
                "src/native/ed25519/sha512.c",
                "src/native/ed25519/sign.c",
                "src/native/ed25519/verify.c",
                "src/native/nimiq_node.cc"
            ],
            "defines": [
                "ARGON2_NO_THREADS"
            ],
            "include_dirs": [
                "<!(node -e \"require('nan')\")",
                "src/native"
            ],
            "cflags_c": [
                "-std=c99",
                "-march=znver1",
                "-O3"
            ],
            "xcode_settings": {
                "OTHER_CFLAGS": [
                    "-march=znver1",
                    "-O3"
                ]
            }
        },

        {
            "target_name": "nimiq_node_generic",
            "sources": [
                "src/native/argon2.c",
                "src/native/blake2/blake2b.c",
                "src/native/core.c",
                "src/native/encoding.c",
                "src/native/nimiq_native.c",
                "src/native/ref.c",
                "src/native/sha256.c",
                "src/native/ed25519/collective.c",
                "src/native/ed25519/fe.c",
                "src/native/ed25519/ge.c",
                "src/native/ed25519/keypair.c",
                "src/native/ed25519/memory.c",
                "src/native/ed25519/sc.c",
                "src/native/ed25519/sha512.c",
                "src/native/ed25519/sign.c",
                "src/native/ed25519/verify.c",
                "src/native/nimiq_node.cc"
            ],
            "defines": [
                "ARGON2_NO_THREADS"
            ],
            "include_dirs": [
                "<!(node -e \"require('nan')\")",
                "src/native"
            ],
            "cflags_c": [
                "-std=c99",
                "-mtune=generic"
            ],
            "xcode_settings": {
                "OTHER_CFLAGS": [
                    "-mtune=generic"
                ]
            }
        }

    ]
}
