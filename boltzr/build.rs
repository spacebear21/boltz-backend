fn main() {
    tonic_build::configure()
        .protoc_arg("--experimental_allow_proto3_optional")
        .compile_protos(&["protos/boltzr.proto"], &["protos"])
        .unwrap_or_else(|e| panic!("Could not build protos: {e}"));

    tonic_build::configure()
        .protoc_arg("--experimental_allow_proto3_optional")
        .compile_protos(&["../proto/cln/node.proto"], &["../proto"])
        .unwrap_or_else(|e| panic!("Could not build CLN protos: {e}"));

    tonic_build::configure()
        .protoc_arg("--experimental_allow_proto3_optional")
        .compile_protos(&["../hold/protos/hold.proto"], &["../hold/protos"])
        .unwrap_or_else(|e| panic!("Could not build CLN hold protos: {e}"));

    built::write_built_file()
        .unwrap_or_else(|e| panic!("Failed to acquire build-time information: {e}"));
}
