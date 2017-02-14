# icbox-lib
NodeJS Library for IcBox

read(buffer, offset, length) {
    return super.read(buffer, offset, length)
      .then(() => promisify(binding.read)(this.fd, buffer, offset, length));
  }