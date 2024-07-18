{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  packages = [ pkgs.gh pkgs.nodejs_22 ];
}
